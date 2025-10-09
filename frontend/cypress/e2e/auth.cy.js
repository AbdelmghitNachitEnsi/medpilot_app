describe('Authentification MEDPILOT', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000')
    })

    it('affiche la page d\'accueil', () => {
        cy.contains('MEDPILOT').should('be.visible')
        cy.contains('Votre santé').should('be.visible')
        cy.contains('notre priorité').should('be.visible')
    })

    it('permet de naviguer vers le formulaire d\'auth', () => {
        cy.contains('Commencer maintenant').click()
        cy.contains('Rejoignez MEDPILOT').should('be.visible')
    })

    it('permet de basculer entre connexion et inscription', () => {
        cy.contains('Commencer maintenant').click()

        cy.contains('Inscription').click()
        cy.get('input[placeholder*="nom d\'utilisateur"]').should('be.visible')

        cy.contains('Connexion').click()
        cy.get('input[placeholder*="nom d\'utilisateur"]').should('not.exist')
    })

    it('remplit le formulaire de connexion', () => {
        cy.contains('Commencer maintenant').click()

        cy.get('input[type="email"]').type('test@medpilot.com')
        cy.get('input[type="password"]').type('password123')

        // Mock de la réponse API
        cy.intercept('POST', '**/auth/login', {
            statusCode: 200,
            body: { token: 'fake-token', role: 'patient', username: 'testuser' }
        })

        cy.contains('Se connecter').click()

        // Vérifie la redirection
        cy.url().should('include', '/patient')
    })
})