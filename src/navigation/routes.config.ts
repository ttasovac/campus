/**
 * Maps named routes to pathnames.
 */
export const routes = {
  home() {
    return { pathname: '/' }
  },
  courseRegistry() {
    return { pathname: '/course-registry' }
  },
  about() {
    return { pathname: '/about' }
  },
  docs(id: string) {
    return { pathname: `/docs/${id}` }
  },
  cms() {
    return { pathname: '/admin' }
  },

  resource(id: string) {
    return { pathname: `/resource/${id}` }
  },
  resources(page = 1) {
    return { pathname: `/resources/${page}` }
  },

  tag(id: string, page = 1) {
    return { pathname: `/tag/${id}/${page}` }
  },
  tags(page = 1) {
    return { pathname: `/tags/${page}` }
  },

  source(id: string, page = 1) {
    return { pathname: `/source/${id}/${page}` }
  },
  sources(page = 1) {
    return { pathname: `/sources/${page}` }
  },

  author(id: string, page = 1) {
    return { pathname: `/author/${id}/${page}` }
  },
} as const
