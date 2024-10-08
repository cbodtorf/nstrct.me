import { Form, routeAction$, z, zod$ } from '@builder.io/qwik-city';
import { component$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import { ClientConn, RequestHandler } from '@builder.io/qwik-city/middleware/request-handler';

export const getLinkUsingPassword = async (key: string, password: string, clientConn: ClientConn, request: Request) => {
  return fetch(`${process.env.API_DOMAIN}/api/v1/shortener/${key}?pw=${password}`, {
    headers: {
      'x-forwarded-for': clientConn.ip || '',
      referer: request.headers.get('referer') || '',
      'user-agent': request.headers.get('user-agent') || '',
    },
  });
};

export const onGet: RequestHandler = async ({ params: { key }, query, redirect, clientConn, request }) => {
  const res = await getLinkUsingPassword(key, query.get('pw') || '', clientConn, request);
  if (res.status !== 401) {
    throw redirect(302, '/unknown');
  }
};

export const usePasswordProtected = routeAction$(
  async ({ password }, { fail, params: { key }, redirect, clientConn, request, headers }) => {
    const res = await getLinkUsingPassword(key, password, clientConn, request);

    const data = await res.json();

    if (res.status === 401) {
      return fail(401, {
        fieldErrors: {
          password: 'Incorrect password',
        },
      });
    }

    if (res.status === 200 && data.url) {
      headers.set('location', data.url);
      return;
    }

    // If the URL is not found, redirect to the unknown URL page
    headers.set('location', '/unknown');
  },
  zod$({
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, {
        message: 'Incorrect password',
      })
      .max(100, {
        message: 'Incorrect password',
      }),
  })
);

export default component$(() => {
  const action = usePasswordProtected();
  return (
    <div class="flex flex-col h-[calc(100vh-64px)]">
      <div class="flex flex-1 content-center justify-center items-center">
        <div class="w-full max-w-lg mx-auto p-6">
          <div class="mt-7 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div class="bg-gray-100 border-b rounded-t-xl py-3 px-4 md:py-4 md:px-5 dark:bg-gray-900 dark:border-gray-700 flex justify-center items-center">
              <img src="/favicon.png" alt="Nstrct.me logo" class="w-10 h-10" />
              <p class="ml-4 text-xl font-semibold text-gray-800 dark:text-white">Nstrct.me</p>
            </div>
            <div class="p-4 sm:p-5">
              <div class="text-center">
                <h1 class="block text-2xl font-bold text-gray-800 dark:text-white">Password Required</h1>
                <p class="mt-4 text-gray-600 dark:text-gray-400">
                  This short link is password protected, please enter the password to view and redirect to the original URL.
                </p>
              </div>
              <div class="mt-6">
                <Form action={action}>
                  <div class="grid gap-y-4">
                    <div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        class="py-3 px-4 w-full input input-bordered"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <button type="submit" class="btn btn-primary w-full">
                      {action.isRunning ? <span class="loading loading-spinner-small"></span> : 'Submit'}
                    </button>
                    {(action.value?.failed || action.value?.fieldErrors?.password) && (
                      <span class="text-error text-left">{action.value?.fieldErrors?.password}</span>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Password Protected URL | Nstrct.me',
  meta: [
    {
      name: 'title',
      content: 'Nstrct.me | Password Protected URL',
    },
    {
      name: 'description',
      content: 'This URL is password protected. Please enter the password to continue to the original URL.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://nstrct.me/password',
    },
    {
      property: 'og:title',
      content: 'Nstrct.me | Password Protected URL',
    },
    {
      property: 'og:description',
      content: 'This URL is password protected. Please enter the password to continue to the original URL.',
    },
    {
      property: 'twitter:card',
      content: 'summary',
    },
    {
      property: 'twitter:title',
      content: 'Nstrct.me | Password Protected URL',
    },
    {
      property: 'twitter:description',
      content: 'This URL is password protected. Please enter the password to continue to the original URL.',
    },
  ],
};
