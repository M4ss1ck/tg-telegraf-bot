import axios from 'axios'

export const ANILIST_URL = 'https://graphql.anilist.co'

export async function getAnimes(search: string, page = 1) {
  const query = `
            query ($page: Int, $perPage: Int, $search: String) {
                Page(page: $page, perPage: $perPage) {
                pageInfo {
                    total
                    perPage
                }
                media(search: $search, type: ANIME, sort: FAVOURITES_DESC) {
                    id
                    title {
                    romaji
                    english
                    native
                    }
                    type
                    genres
                }
                }
            }
   `

  const variables = {
    search,
    page,
    perPage: 5,
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const result = await axios.post(ANILIST_URL, {
    query,
    variables,
    headers,
  }).catch(err => console.log(err.message))

  return result?.data?.data
}

export async function getAnime(id: number) {
  const query = `
        query ($id: Int) { # Define which variables will be used in the query (id)
            Media (id: $id, type: ANIME) { # Insert our variables into the query arguments (id) (type: ANIME is hard-coded in the query)
            id
            title {
                romaji
                english
                native
            }
            description (asHtml: false)
            seasonYear
            episodes
            coverImage {
                extraLarge
                large
                medium
                color
              }
            }
        }
    `
  const variables = {
    id,
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const result = await axios.post(ANILIST_URL, {
    query,
    variables,
    headers,
  }).catch(err => console.log(err.message))

  return result?.data?.data
}

export async function getIsBirthdayCharacters(page = 1) {
  const query = `
    query ($page: Int, $perPage: Int, $search: String) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          total
          perPage
        }
        characters(isBirthday: true, search: $search) {
          id
          name {
            first
            middle
            last
            full
            native
            userPreferred
          }
          image {
            large
            medium
          }
          description
          dateOfBirth {
            year
            month
            day
          }
          age
          gender
          bloodType
          siteUrl
        }
      }
    }
  `

  const variables = {
    page,
    perPage: 10,
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const result = await axios.post(ANILIST_URL, {
    query,
    variables,
    headers,
  }).catch(err => console.log(err.message))

  return result?.data?.data
}
