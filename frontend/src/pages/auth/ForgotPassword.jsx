import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import TextInput from "../../components/ui/TextInput";
import AuthContext from "../../context/AuthContext";
import AuthShell from "./AuthShell";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [devResetLink, setDevResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDevResetLink("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);
      setMessage(data.message);
      if (data.devResetLink) {
        setDevResetLink(data.devResetLink);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset email could not be sent.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot Password"
      subtitle="Enter your account email and we will send you a password reset link."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Email Address
          </label>
          <TextInput
            autoComplete="email"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {message && (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {devResetLink && (
          <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Development reset link:{" "}
            <a className="font-semibold underline" href={devResetLink}>
              open link
            </a>
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Sending reset link..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Remember your password?{" "}
        <Link to="/login" className="font-semibold text-blue-700">
          Login
        </Link>
      </p>
    </AuthShell>
  );
};

export default ForgotPassword;
