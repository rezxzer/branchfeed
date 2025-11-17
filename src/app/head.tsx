import { siteConfig } from '@/config/site'

export default function Head() {
  return (
    <>
      <link rel="preload" as="image" href={siteConfig.ogImage} />
      <link rel="preconnect" href={new URL(siteConfig.url).origin} crossOrigin="anonymous" />
      <meta name="theme-color" content="#0b1220" />
    </>
  )
}
