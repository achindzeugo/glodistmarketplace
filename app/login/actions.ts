// app/login/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const response = await fetch('https://glodistapi.onrender.com/api/auth/login/', { // Votre API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    console.log(JSON.stringify({ email, password }))
    console.log(response)

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        // Supposons que l'API retourne un token
        (await cookies()).set('auth_token', data.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 }); // 1 jour
        redirect('/'); // Redirection après succès
    } else {
        // Gérer l'erreur (afficher un message, etc.)
        console.error('Échec de la connexion');
    }
}
