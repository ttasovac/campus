import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  useAccordionItemContext,
} from '@reach/accordion'
import cx from 'clsx'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Fragment } from 'react'

import { Svg as ChevronIcon } from '@/assets/icons/chevron.svg'
import { Icon } from '@/common/Icon'
import { Section } from '@/common/Section'

/**
 * FAQ section on home page.
 */
export function FAQ(): JSX.Element {
  const questions = [
    {
      title: 'What is DARIAH?',
      text: (
        <Fragment>
          <p>
            DARIAH is a pan-European infrastructure for arts and humanities
            scholars working with computational methods. It supports digital
            research as well as the teaching of digital research methods.
          </p>
          <p>
            To learn more, check out{' '}
            <Anchor href="https://www.dariah.eu/">dariah.eu</Anchor>.
          </p>
        </Fragment>
      ),
    },
    {
      title: 'What is DARIAH-CAMPUS?',
      text: (
        <Fragment>
          <p>
            DARIAH-Campus is a pilot project exploring different ways of
            capturing and consolidating DARIAH learning resources. It is being
            developed in the context of a H2020-funded project{' '}
            <Anchor href="https://www.dariah.eu/activities/projects-and-affiliations/desir/">
              DESIR
            </Anchor>
            .
          </p>
          <p>
            Being a pilot project, DESIR-CAMPUS is not yet ready for an official
            release. We will be evaluating the project in the coming months and
            make a decision on how to proceed.
          </p>
        </Fragment>
      ),
    },
    {
      title: 'Is DARIAH-CAMPUS exhaustive?',
      text: (
        <Fragment>
          <p>
            Definitely not. It’s a pilot project and therefore limited in scope.
            If you can think of ways to contribute or if you know of resources
            that should be represented on DARIAH-CAMPUS, feel free to get in
            touch.
          </p>
        </Fragment>
      ),
    },
    {
      title: 'How to get in touch?',
      text: (
        <Fragment>
          <p>
            The easiest way for you to get in touch with us is by using the
            <Anchor href="https://www.dariah.eu/helpdesk/">
              DARIAH Help Desk
            </Anchor>
            . Make sure you select &quot;Education and training&quot; as the
            subject of your message.
          </p>
        </Fragment>
      ),
    },
    {
      title: 'What is DARIAH-CAMPUS powered by?',
      text: (
        <Fragment>
          <p>
            In addition to being powered by an enthusiasm for research
            infrastructures and an awareness of the importance of training and
            education for building sustainable RIs, DARIAH-CAMPUS is a
            <Anchor href="https://www.nextjs.org">Next.js</Anchor>
            -powered website hosted on{' '}
            <Anchor href="https://www.netlify.com/">Netlify</Anchor>.
          </p>
        </Fragment>
      ),
    },
  ]

  return (
    <Section>
      <Section.Title>Frequently asked questions</Section.Title>
      <Section.LeadIn>Time is precious, we know</Section.LeadIn>
      <Accordion
        as="ul"
        collapsible
        className="flex flex-col w-full max-w-screen-md py-6 mx-auto space-y-6 text-lg"
      >
        {questions.map((question, index) => {
          return (
            <AccordionItem as="li" key={index} className="flex flex-col">
              <AccordionHeader>{question.title}</AccordionHeader>
              <AccordionPanel className="p-6 space-y-2 text-left">
                {question.text}
              </AccordionPanel>
            </AccordionItem>
          )
        })}
      </Accordion>
    </Section>
  )
}

function Anchor(props: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-0.5 underline transition rounded text-primary-600 hover:no-underline focus:outline-none focus-visible:ring focus-visible:ring-primary-600"
    >
      {props.children}
    </a>
  )
}

interface AccordionHeaderProps {
  children?: ReactNode
}

function AccordionHeader(props: AccordionHeaderProps): JSX.Element {
  const { isExpanded } = useAccordionItemContext()

  return (
    <h3 className="flex flex-1">
      <AccordionButton className="flex items-center justify-between flex-1 p-6 transition border border-neutral-100 rounded-xl shadow-card-md hover:shadow-card-lg text-primary-600 focus:outline-none focus-visible:ring focus-visible:ring-primary-600">
        <span>{props.children}</span>
        <Icon
          icon={ChevronIcon}
          className={cx(
            'w-4 h-4 transition transform',
            isExpanded && 'rotate-180',
          )}
        />
      </AccordionButton>
    </h3>
  )
}
