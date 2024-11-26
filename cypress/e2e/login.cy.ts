describe('Login page', () => {
    beforeEach(() => {
        cy.visit('/');
        cy.get("[data-cy='login-btn']").click();
    });

    it("Login successfully", () => {
        cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");
        cy.get("[data-cy='login-description']").should("have.text", "Enter your Credentials to access your account");

        cy.get("[data-cy='email-input'] label").should("have.text", "Email address *");
        cy.get("[data-cy='email-input'] input").should("have.attr", "placeholder" , "Enter your email address");

        cy.get("[data-cy='password-input'] label").should("have.text", "Password *");
        cy.get("[data-cy='password-input'] input").should("have.attr", "placeholder" , "Enter your password");

        cy.intercept({
            method: 'POST',
            https: true,
            url: "**/auth/v1/token?grant_type=password",
        }, {
            statusCode: 200,
            body: {
                access_token: "access_token",
                refresh_token: "refresh_token",
                expires_at: 3000950,
                expires_in: 120950,
                token_type: "bearer",
                user: {
                    id: "b4ebcf93-7b09-4ee1-bbb3-0a67c1cb1748",
                    app_metadata: {},
                    user_metadata: {},
                    aud: "fb2e796d-69f7-451a-8434-2307d1436d48",
                    email: "myemail@gmail.com"
                },
            }
        }).as("login");

        cy.login("myemail@gmail.com", "myAmazing@password");

        cy.wait("@login").should(({ request }) => {
            expect(request.body.password).to.equals("myAmazing@password");
            expect(request.body.email).to.equals("myemail@gmail.com");
        });

        cy.get("[data-cy='dashboard-welcome']").should("have.text", "Welcome to the dashboard myemail@gmail.com");
    });

    describe("Falling cases", () => {
        it("Display an error message when the credentials are wrong", () => {
            cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");

            cy.intercept({
                method: 'POST',
                https: true,
                url: "**/auth/v1/token?grant_type=password",
            }, {
                statusCode: 400,
                body: {
                    error_code: "invalid_credentials",
                    message: "Invalid login credentials",
                }
            }).as("loginWithInvalidCredentials");

            cy.login("myWrongemail@gmail.com", "myAmazingWrong@password");

            cy.wait("@loginWithInvalidCredentials").should(({ request }) => {
                expect(request.body.password).to.equals("myAmazingWrong@password");
                expect(request.body.email).to.equals("myWrongemail@gmail.com");
            });

            cy.get("[data-cy='login-error-message']").should("have.text", "Incorrect email or password");

            cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");
        });

        it("Display an error message when we have a server error", () => {
            cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");

            cy.intercept({
                method: 'POST',
                https: true,
                url: "**/auth/v1/token?grant_type=password",
            }, {
                statusCode: 500,
                body: {
                    error_code: "InternalError",
                    message: "An internal server error occurred"
                }
            }).as("loginWithInvalidCredentials");

            cy.login("myErroremail@gmail.com", "myAmazingWrong@password");

            cy.wait("@loginWithInvalidCredentials").should(({ request }) => {
                expect(request.body.password).to.equals("myAmazingWrong@password");
                expect(request.body.email).to.equals("myErroremail@gmail.com");
            });

            cy.get("[data-cy='login-error-message']").should("have.text", "An enforcing error has occurred, please try again or report it");

            cy.get("[data-cy='login-title']").should("have.text", "Welcome back!");
        });
    });
});

