import type { GetStaticPropsContext, GetStaticPropsResult } from 'next'
import { Fragment } from 'react'

import type { Person } from '@/api/cms/person'
import { getPersonById } from '@/api/cms/person'
import { PageContent } from '@/common/PageContent'
import { Browse } from '@/home/Browse'
import { FAQ } from '@/home/FAQ'
import { FeaturedVideos } from '@/home/FeaturedVideos'
import { Hero } from '@/home/Hero'
import { Team } from '@/home/Team'
import { getLocale } from '@/i18n/getLocale'
import type { Dictionary } from '@/i18n/loadDictionary'
import { loadDictionary } from '@/i18n/loadDictionary'
import { useI18n } from '@/i18n/useI18n'
import { Metadata } from '@/metadata/Metadata'
import { useAlternateUrls } from '@/metadata/useAlternateUrls'
import { useCanonicalUrl } from '@/metadata/useCanonicalUrl'
import type { FilePath } from '@/utils/ts/aliases'
import featured from '~/config/featured.json'
import teamMembers from '~/config/team.json'

interface FeaturedVideo {
  id: string
  title: string
  subtitle: string
  image: FilePath
}
export interface HomePageProps {
  dictionary: Dictionary
  team: Array<Person>
  videos: Array<FeaturedVideo>
}

/**
 * Provides data and translations for home page.
 */
export async function getStaticProps(
  context: GetStaticPropsContext,
): Promise<GetStaticPropsResult<HomePageProps>> {
  const { locale } = getLocale(context)

  const dictionary = await loadDictionary(locale, ['common'])

  const teamIds = teamMembers.sort()
  const team = await Promise.all(teamIds.map((id) => getPersonById(id, locale)))

  const videos = featured.videos

  return {
    props: {
      dictionary,
      team,
      videos,
    },
  }
}

/**
 * Home page.
 */
export default function HomePage(props: HomePageProps): JSX.Element {
  const { t } = useI18n()
  const canonicalUrl = useCanonicalUrl()
  const languageAlternates = useAlternateUrls()

  return (
    <Fragment>
      <Metadata
        title={t('common.page.home')}
        canonicalUrl={canonicalUrl}
        languageAlternates={languageAlternates}
      />
      <PageContent className="max-w-screen-lg px-6 py-24 mx-auto space-y-24 w-full">
        <Hero />
        <Browse />
        <FAQ />
        <FeaturedVideos videos={props.videos} />
        <Team team={props.team} />
      </PageContent>
    </Fragment>
  )
}
