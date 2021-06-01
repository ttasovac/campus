import { Section } from '@/common/Section'
import type { HomePageProps } from '@/pages/index.page'

export interface TeamProps {
  team: HomePageProps['team']
}

/**
 * Team section on home page.
 */
export function Team(props: TeamProps): JSX.Element {
  return (
    <Section>
      <Section.Title>We are here to help</Section.Title>
      <Section.LeadIn>
        Our DARIAH-CAMPUS team is just an email away and ready to answer your
        questions
      </Section.LeadIn>
      <ul className="grid grid-cols-2 gap-8 py-6 mx-auto md:grid-cols-4">
        {props.team.map((person, index) => {
          return (
            <li key={index} className="flex flex-col items-center">
              <img
                src={person.avatar}
                alt=""
                loading="lazy"
                className="w-24 h-24 mb-2 rounded-full"
              />
              <h3 className="font-bold">
                {[person.firstName, person.lastName].join(' ')}
              </h3>
              <p className="text-sm text-neutral-500">{person.title}</p>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
