describe('Gestion des Rendez-vous', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/rdv')

        // Mock du localStorage
        cy.window().then((win) => {
            win.localStorage.setItem('token', 'fake-token')
            win.localStorage.setItem('role', 'patient')
        })
    })

    it('affiche la page de rendez-vous', () => {
        cy.contains('Nouvelle Consultation').should('be.visible')
        cy.contains('Mes Rendez-vous Programmes').should('be.visible')
    })

    it('permet de prendre un rendez-vous', () => {
        // Mock des médecins
        cy.intercept('GET', '**/doctors', {
            statusCode: 200,
            body: [
                { id: '1', username: 'Dr. Dupont', specialty: 'Cardiologie' },
                { id: '2', username: 'Dr. Martin', specialty: 'Pédiatrie' }
            ]
        })

        // Étape 1: Choisir un médecin
        cy.contains('Dr. Dupont').click()
        cy.contains('Suivant').click()

        // Étape 2: Choisir une date
        cy.get('input[type="date"]').type('2024-12-15')
        cy.contains('Suivant').click()

        // Étape 3: Choisir un horaire
        cy.contains('09:00').click()

        // Mock de la création de RDV
        cy.intercept('POST', '**/rendezvous', {
            statusCode: 200,
            body: { message: 'Rendez-vous créé avec succès' }
        })

        cy.contains('Confirmer le rendez-vous').click()
        cy.contains('Rendez-vous confirmé').should('be.visible')
    })
})