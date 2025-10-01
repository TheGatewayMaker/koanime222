import { Layout } from "../components/Layout";

export default function Signup() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-xl border p-6 shadow-sm">
          <h1 className="text-center text-2xl font-bold">
            Create your account
          </h1>
          <p className="mt-1 text-center text-sm text-foreground/70">
            Join KoAnime to track your watch history
          </p>
          <form className="mt-6 space-y-3">
            <div>
              <label className="text-sm">Name</label>
              <input
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-sm">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground"
            >
              Sign up
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-primary underline">
              Log in
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
