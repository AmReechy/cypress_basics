/// <reference types="Cypress" />

describe('Test Nairaland Site', () => {
    beforeEach(() => {
        cy.visit('https://www.nairaland.com/')
    })
  
    it('Checks if some important links are present on the homepage, with correct text content', () => {

        const impLinks = ["login", "register", "trending", "recent", "topics"]

        impLinks.forEach((link) => {
            let capLink = link[0].toUpperCase() + link.slice(1)
            cy.get(`[href$="${link}"]`).contains(link != "topics"? capLink : "New")
        })

        // important main sections
        const impSections = {
            nairaland: "Nairaland / General",
            entertainment: "Entertainment",
            science: 'Science/Technology'
        }

        for (const [key, value] of Object.entries(impSections)) {
            cy.get(`[href="/${key}"]`).contains(value)
        }
        
    })

    it('Checks that the total number of the home page featured news links are more than 30 and less than 100', () => {
        cy.get(".featured > a")
        .should("have.length.above", 30)
        .and("have.length.below", 100)

        //equivalent to the above
        cy.get(".featured > a")
        .should("have.length.within", 30, 100)
    })

    it('Types in the search input (using data from json file), clicks on the search button and inspects the new location', () => {
        let search;
        cy.fixture('data.json').then((jsonData) => {
            search = jsonData.searchText
            cy.get('input[name="q"]').eq(0).clear().type(search)
            cy.get('input[value="Search"]').eq(0).click()
        })

        cy.location().should((location) => {
            //alert(location.toString())
            expect(location.host).to.eq("www.nairaland.com")
            let arrayOfQueryStrings = search.split(" ")
            for(let string of arrayOfQueryStrings) {
                expect(location.search).to.contain(string)
            }
            
        })
        
    })

    it.skip('Attemps to login to nairaland with fake credentials', () => {
        cy.get("[href='/login']").click()
        cy.get("input[name='login'][type='text']").type('fakeusername')
        cy.get("input[name='password'][type='password']").type('fakepassword')
        cy.get("input[type='submit'][value='Login']").click()
        cy.contains('Wrong Username or Password')

    })

    it('Navigates to some pages and make assertions', () => {
        //go to the register page and check that the page contains an editable email input for registration
        cy.get("[href='/register']").click()
        cy.get("input[name='email'][type='text']").as('emailInput')
        cy.get('@emailInput').clear().type("useremail")
        cy.get('@emailInput').should("have.value", "useremail")

        // go to the politics section page. Check the title and location of the page
        cy.visit('https://www.nairaland.com/')
        cy.get('[href="/politics"]').should("have.text", "Politics").click()
        cy.title().should("include", "Politics")
        cy.location().should((loc) => {
            expect(loc.pathname).to.include('politics')
        })

        // click on a random news on the home page, and make assertions about the new location based on the link clicked
        cy.visit('https://www.nairaland.com/')
        cy.get(".featured > a").then((newsLinks) => {
            const randomIndex = Math.floor(Math.random() * (newsLinks.length + 1))
            //alert(randomIndex)
            const selectedNews = newsLinks[randomIndex]
            const newsHrefPathname = new URL(selectedNews.href).pathname;
            cy.get(".featured > a").eq(randomIndex).click()
            cy.location().should((location) => {
                expect(location.pathname).to.eq(newsHrefPathname)
            })
        })
    })

    
})