import Notify from '../../assets/svg/notify.svg?jsx';
import { component$, useSignal, $ } from '@builder.io/qwik';
import { DocumentHead, Form, globalAction$, z, zod$ } from '@builder.io/qwik-city';
import { isValidUrl, normalizeUrl } from '../../utils';
import { useToaster } from '../../components/toaster/toaster';

const VALID_CATEGORIES = ['Phishing', 'Malware', 'Child abuse', 'Violence', 'Spam', 'Illegal content', 'Other'];

export const useReport = globalAction$(
  async ({ link, category }, { fail }) => {
    const data: Response = await fetch(`${process.env.API_DOMAIN}/api/v1/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        link,
        category,
      }),
    });

    const { message } = await data.json();

    if (!data.ok) {
      return fail(400, {
        message,
      });
    }

    return {
      message: 'Your report has been submitted. Thank you for helping us keep Nstrct.me safe.',
    };
  },
  zod$({
    link: z
      .string({
        required_error: 'This field is required',
      })
      .transform((url) => normalizeUrl(url))
      .refine((url) => isValidUrl(url), {
        message: 'Please enter a valid URL',
      }),
    category: z
      .string({
        required_error: 'Category is required',
      })
      .refine((name) => VALID_CATEGORIES.includes(name), {
        message: 'Please select a valid category',
      }),
  })
);

export default component$(() => {
  const action = useReport();
  const toaster = useToaster();

  const linkValue = useSignal('');
  const categoryRef = useSignal<Element>();

  const clearValues = $(() => {
    linkValue.value = '';
    categoryRef.value!.querySelector('option')!.selected = true;
  });

  return (
    <div class="h-[calc(100vh-64px)]">
      <section class="max-w-xl px-4 sm:py-20 py-5 mx-auto space-y-1">
        <Notify class="h-[400px] sm:block hidden w-1/2 mx-auto mt-[-230px]" />
        <div class="text-left">
          <h1 class="text-lg font-bold">Report abuse</h1>
          <p class="text-gray-600 dark:text-gray-300">
            If you believe a link violates our terms of service, please report it below. We will review the link and take appropriate
            action. Thank you for helping us keep Nstrct.me safe.
          </p>
          <div class="divider"></div>
          <Form
            action={action}
            onSubmitCompleted$={() => {
              if (action.status !== 200) {
                return;
              }

              clearValues();

              toaster.add({
                title: 'Report submitted',
                description: 'Report has been submitted successfully!',
              });
            }}
            class="form-control"
          >
            <label class="join input-group sm:inline-flex block w-full">
              <div class="form-control w-full">
                <input
                  name="link"
                  type="text"
                  placeholder="nstrct.me/example"
                  class="input input-bordered join-item focus:outline-0 w-full sm:!rounded-e-none !rounded-e-lg"
                  onInput$={(ev: InputEvent) => {
                    linkValue.value = (ev.target as HTMLInputElement).value;
                  }}
                  value={linkValue.value}
                />
                {action.value?.fieldErrors?.link && (
                  <label class="label">
                    <span class="label-text-alt text-error">{action.value.fieldErrors.link}</span>
                  </label>
                )}
              </div>
              <div class="form-control w-1/2 mt-3 sm:mt-0">
                <select
                  name="category"
                  class="select join-item select-bordered focus:outline-0 sm:inline-flex block sm:!rounded-none !rounded-lg"
                  ref={categoryRef}
                >
                  <option disabled selected>
                    Select a reason
                  </option>
                  {VALID_CATEGORIES.map((category, index) => (
                    <option key={index}>{category}</option>
                  ))}
                </select>
                {action.value?.fieldErrors?.category && (
                  <label class="label">
                    <span class="label-text-alt text-error">{action.value.fieldErrors.category}</span>
                  </label>
                )}
              </div>
              <button
                type="submit"
                class="btn join-item btn-warning sm:inline-flex block sm:!rounded-e-lg sm:!rounded-l-none !rounded-lg mt-3 sm:mt-0 min-w-[80px]"
              >
                {action.isRunning ? <span class="loading loading-spinner-small"></span> : 'Report'}
              </button>
            </label>
          </Form>
          {action.value?.message && action.value.failed && <span class="label-text-alt text-error text-left">{action.value.message}</span>}
        </div>
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'Nstrct.me | Report Link',
  meta: [
    {
      name: 'title',
      content: 'Nstrct.me | Report Link',
    },
    {
      name: 'description',
      content: 'Nstrct.me | Report a link that violates our terms of service.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://nstrct.me/register',
    },
    {
      property: 'og:title',
      content: 'Nstrct.me | Report Link',
    },
    {
      property: 'og:description',
      content: 'Nstrct.me | Report a link that violates our terms of service.',
    },
    {
      property: 'twitter:card',
      content: 'summary',
    },
    {
      property: 'twitter:title',
      content: 'Nstrct.me | Report Link',
    },
    {
      property: 'twitter:description',
      content: 'Nstrct.me | Report a link that violates our terms of service.',
    },
  ],
};
