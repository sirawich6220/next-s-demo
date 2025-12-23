export default function DiscordLoginButton() {
  const login = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <button
      onClick={login}
      className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500
      font-semibold text-white transition"
    >
      Login with Discord
    </button>
  );
}
