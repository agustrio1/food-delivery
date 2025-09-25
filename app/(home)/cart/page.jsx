export const metadata = {
  title: 'My Page Title',
  description: 'Deskripsi singkat halaman kamu untuk SEO',
  openGraph: {
    title: 'My Page Title',
    description: 'Deskripsi singkat untuk media sosial',
    url: 'https://example.com',
    siteName: 'Nama Situs Kamu',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-4">Selamat datang di Next Js</h1>
      <p className="text-gray-700">
        Keranjang.
      </p>
    </main>
  );
}