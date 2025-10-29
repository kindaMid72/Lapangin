
// imports

// auth provider
import { createClientInstance } from "@/utils/supabase/server.js"; // this will create an instance for supabase server

export default async function ProtectedRoute({ children }) {
    const supabase = await createClientInstance();
    
    return(<>
    {children}
    </>)
}