describe('Tableau de bord Patient', () => {
    beforeEach(() => {
        // Simuler une connexion
        cy.visit('http://localhost:3000/patient')

        // Mock du localStorage
        cy.window().then((win) => {
            win.localStorage.setItem('token', 'fake-token')
            win.localStorage.setItem('role', 'patient')
            win.localStorage.setItem('username', 'Test Patient')
        })
    })

    it('affiche le dashboard patient', () => {
        cy.contains('Assistant Médical').should('be.visible')
        cy.contains('Bienvenue, Test Patient').should('be.visible')
    })

    it('permet d\'envoyer un message au chatbot', () => {
        cy.get('textarea[placeholder*="question médicale"]').type('Bonjour, j\'ai mal à la tête')

        // Mock de l'API Gemini
        cy.intercept('POST', '**/generateContent**', {
            statusCode: 200,
            body: {
                candidates: [{
                    content: {
                        parts: [{ text: 'Je suis désolé d\'apprendre que vous avez mal à la tête...' }]
                    }
                }]
            }
        })

        cy.contains('envoyer').click()
        cy.contains('Je suis désolé').should('be.visible')
    })

    it('permet de naviguer vers les rendez-vous', () => {
        cy.contains('Prendre RDV').click()
        cy.url().should('include', '/rdv')
    })
})