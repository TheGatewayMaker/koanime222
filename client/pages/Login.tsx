import { Layout } from "../components/Layout";

export default function Login() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-xl border p-6 shadow-sm">
          <h1 className="text-center text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-center text-sm text-foreground/70">Log in to continue watching</p>
          <form className="mt-6 space-y-3">
            <div>
              <label className="text-sm">Email</label>
              <input type="email" className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <input type="password" className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="••••••••" />
            </div>
            <button type="submit" className="mt-2 w-full rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground">Log in</button>
          </form>
          <div className="mt-4 text-center text-sm">
            New here? <a href="/signup" className="text-primary underline">Create an account</a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
