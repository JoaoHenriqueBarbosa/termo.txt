import "./globals.css";

export const metadata = {
  title: "termo.txt",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/ryanoasis/nerd-fonts@v3.2.1/patched-fonts/JetBrainsMono/Ligatures/Regular/JetBrainsMonoNerdFont-Regular.ttf"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
