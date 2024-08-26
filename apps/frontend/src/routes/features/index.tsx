import { component$ } from '@builder.io/qwik';
import { Footer } from '../../components/footer/footer';
import { DocumentHead } from '@builder.io/qwik-city';
import { Features } from '../../components/features/features';
import { Background } from '../../components/background/background';

export default component$(() => {
  return (
    <>
      <Background />
      <Features />
      <Footer />
    </>
  );
});
export const head: DocumentHead = {
  title: 'Features Page | Nstrct.me - Free & Open-Source URL Shortener',
  meta: [
    {
      name: 'title',
      content: 'Features Page | Nstrct.me - Free & Open-Source URL Shortener',
    },
    {
      name: 'description',
      content:
        'Discover the features of Nstrct.me, the free and open-source URL shortener. Learn how to simplify your links and enhance your link sharing and tracking!',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://nstrct.me',
    },
    {
      property: 'og:title',
      content: 'Features Page | Nstrct.me - Free & Open-Source URL Shortener',
    },
    {
      property: 'og:description',
      content:
        'Discover the features of Nstrct.me, the free and open-source URL shortener. Learn how to simplify your links and enhance your link sharing and tracking!',
    },
    {
      property: 'og:image',
      content: 'https://nstrct.me/images/thumbnail.png',
    },
    {
      property: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      property: 'twitter:url',
      content: 'https://nstrct.me',
    },
    {
      property: 'twitter:title',
      content: 'Features Page | Nstrct.me - Free & Open-Source URL Shortener',
    },
    {
      property: 'twitter:description',
      content:
        'Discover the features of Nstrct.me, the free and open-source URL shortener. Learn how to simplify your links and enhance your link sharing and tracking!',
    },
    {
      property: 'twitter:image',
      content: 'https://nstrct.me/images/thumbnail.png',
    },
  ],
};
