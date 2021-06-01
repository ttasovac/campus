import type { FC } from 'react'

import { YouTube } from '@/common/YouTube'
import { ExternalResource } from '@/post/ExternalResource'
import { Grid } from '@/post/Grid'
import { SideNote } from '@/post/SideNote'
import { VideoCard } from '@/post/VideoCard'
import { Quiz } from '@/post/quiz/Quiz'

// export type ComponentType =
//   /** Layout wrapper. */
//   | 'wrapper'
//   /** CommonMark. */
//   | 'a'
//   | 'blockquote'
//   | 'code'
//   | 'em'
//   | 'h1'
//   | 'h2'
//   | 'h3'
//   | 'h4'
//   | 'h5'
//   | 'h6'
//   | 'hr'
//   | 'img'
//   | 'li'
//   | 'ol'
//   | 'p'
//   | 'pre'
//   | 'strong'
//   | 'ul'
//   /** GitHub markdown. */
//   | 'del'
//   | 'table'
//   | 'tbody'
//   | 'td'
//   | 'th'
//   | 'thead'
//   | 'tr'

// export type ComponentMap = {
//   [key in ComponentType]?: JSX.IntrinsicElements | FC
// }

export type ComponentMap = {
  [name: string]: JSX.IntrinsicElements | FC<never>
}

/**
 * Legacy component names.
 */
const legacy: ComponentMap = {
  CTA: ExternalResource,
  Youtube: YouTube,
}

/**
 * Custom components allowed in mdx content.
 */
export const components: ComponentMap = {
  ...legacy,
  // Abbreviation,
  // Accordion,
  // Disclosure, // Details,
  ExternalResource,
  Grid,
  Quiz,
  SideNote, // CallOut,
  // Tabs,
  VideoCard,
  YouTube,
}
