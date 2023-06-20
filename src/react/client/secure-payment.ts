interface PaymentRequestOptions {

}

interface NewPaymentRequest {
    new (): PaymentRequest
}

interface PaymentRequest {
    canMakePayment(): Promise<boolean>;
}

export function isPaymentRequestWindow(window: Window): boolean {
    return "PaymentRequest" in window
}

export async function isSecurePaymentConfirmationSupported() {
    if (!isPaymentRequestWindow(window)) {
        return [false, 'Payment Request API is not supported'];
    }

    try {
        // The data below is the minimum required to create the request and
        // check if a payment can be made.
        const supportedInstruments = [
            {
                supportedMethods: "secure-payment-confirmation",
                data: {
                    // RP's hostname as its ID
                    rpId: 'rp.example',
                    // A dummy credential ID
                    credentialIds: [new Uint8Array(1)],
                    // A dummy challenge
                    challenge: new Uint8Array(1),
                    instrument: {
                        // Non-empty display name string
                        displayName: ' ',
                        // Transparent-black pixel.
                        icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==',
                    },
                    // A dummy merchant origin
                    payeeOrigin: 'https://non-existent.example',
                }
            }
        ];

        const details = {
            // Dummy shopping details
            total: {label: 'Total', amount: {currency: 'USD', value: '0'}},
        };

        const request = new PaymentRequest(supportedInstruments, details);
        const canMakePayment = await request.canMakePayment();
        return [canMakePayment, canMakePayment ? '' : 'SPC is not available'];
    } catch (error) {
        console.error(error);
        return [false, error.message];
    }
}

export interface PaymentMethodInfo {
    paymentMethodId: string;
    paymentMethodName: string;
    challenge: string;
    credentialIds: string[];
    payeeOrigin?: string;
}

export async function authenticatePaymentMethod({ credentialIds, challenge, paymentMethodName, payeeOrigin }: PaymentMethodInfo) {
    const request = new PaymentRequest([{
        // Specify `secure-payment-confirmation` as payment method.
        supportedMethods: "secure-payment-confirmation",
        data: {
            // The RP ID
            rpId: location.hostname,

            // List of credential IDs obtained from the RP server.
            credentialIds: credentialIds.flatMap(value => value.split("_")).map(base64ToArrayBuffer),

            // The challenge is also obtained from the RP server.
            challenge: base64ToArrayBuffer(challenge),

            // A display name and an icon that represent the payment instrument.
            instrument: {
                displayName: paymentMethodName,
                // Transparent-black pixel.
                icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
                iconMustBeShown: false
            },

            // The origin of the payee (merchant)
            payeeOrigin: payeeOrigin || location.origin,

            // The number of milliseconds to timeout.
            timeout: 360000,  // 6 minutes
        }
    }], {
        // Payment details.
        total: {
            label: "Total",
            amount: {
                currency: "USD",
                value: "5.00",
            },
        },
    });

    try {
        const response = await request.show();

        console.log(response.details);
        //
        // // response.details is a PublicKeyCredential, with a clientDataJSON that
        // // contains the transaction data for verification by the issuing bank.
        // // Make sure to serialize the binary part of the credential before
        // // transferring to the server.
        // const result = fetchFromServer('https://rp.example/spc-auth-response', response.details);
        // if (result.success) {
        //     await response.complete('success');
        // } else {
        //     await response.complete('fail');
        // }
    } catch (err) {
        // SPC cannot be used; merchant should fallback to traditional flows
        console.error(err);
    }
}

function base64ToArrayBuffer(base64: string) {
    // if (base64.includes("_")) {
    //     const [, b, next] = base64.split("_");
    //     if (next) {
    //         throw new Error("Expected triple part key");
    //     }
    //     return base64ToArrayBuffer(b);
    // }
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}