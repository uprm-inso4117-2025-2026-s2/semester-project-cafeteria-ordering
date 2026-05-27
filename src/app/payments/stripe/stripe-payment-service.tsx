import { Alert } from 'react-native';
import { confirmPayment } from '@stripe/stripe-react-native';


const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;


export class StripePaymentService {
    async processPayment(
        
        amount: number,
        billingDetails: {
            name: string;
            address?: {
                line1?: string;
                line2?: string;
                city?: string;
                postalCode?: string;
                country?: string;
            };

        }

    ): Promise<{success: boolean; paymentIntentId?: string}> {
        try {

            console.log('Stripe payment starting:', amount);

            
            const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({ amount }),
                }
            );

            const { clientSecret, error: fetchError } = await response.json();

            if (fetchError || !clientSecret) {
                console.error('Failed to create payment intent:', fetchError);
                Alert.alert('Payment Error', 'Could not initialize payment.');
                return { success: false };
            }


            const { paymentIntent, error: confirmError } = await confirmPayment(
                clientSecret,
                {
                    paymentMethodType: 'Card',
                    paymentMethodData: { billingDetails },
                }
            );

            if (confirmError) {
                console.error('Payment confirmation failed:', confirmError);
                Alert.alert('Payment Failed', confirmError.message);
                return { success: false };
            }

            console.log('Payment confirmed:', paymentIntent);
            return { success: true, paymentIntentId: paymentIntent?.id };

        } catch (e) {
            console.error('Stripe error:', e);
            Alert.alert('Payment Failed', 'Something went wrong.');
            return { success: false };
        }
    }
}