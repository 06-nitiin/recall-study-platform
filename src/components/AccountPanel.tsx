import { KeyRound, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import {
  changePassword,
  updateProfile,
  type CurrentUser,
} from "../lib/api";

export function AccountPanel({
  user,
  onUpdated,
}: {
  user: CurrentUser;
  onUpdated: (user: CurrentUser) => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const result = await updateProfile({ displayName });
      onUpdated(result.user);
      setProfileMessage("Profile saved.");
    } catch (reason) {
      setProfileMessage(
        reason instanceof Error
          ? reason.message
          : "Could not save profile."
      );
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await changePassword(passwords);
      setPasswords({
        currentPassword: "",
        newPassword: "",
      });
      setPasswordMessage("Password changed.");
    } catch (reason) {
      setPasswordMessage(
        reason instanceof Error
          ? reason.message
          : "Could not change password."
      );
    }
  };

  return (
    <section className="mx-auto mt-6 max-w-6xl rounded-[1.5rem] border border-slate-200 bg-white p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[.15em] text-emerald-700">
          Account
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Profile and security
        </h2>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <form
          className="rounded-xl bg-slate-50 p-4"
          onSubmit={saveProfile}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <UserRound className="size-4" />
            Profile
          </div>

          <p className="mt-2 text-sm text-slate-600">
            {user.email}
          </p>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Display name

            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              value={displayName}
              minLength={2}
              maxLength={80}
              required
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>

          <button className="mt-4 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
            Save profile
          </button>

          {profileMessage && (
            <p
              className="mt-3 text-sm text-slate-600"
              role="status"
            >
              {profileMessage}
            </p>
          )}
        </form>

        <form
          className="rounded-xl bg-slate-50 p-4"
          onSubmit={savePassword}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="size-4" />
            Change password
          </div>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            Current password

            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              required
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  currentPassword: event.target.value,
                })
              }
            />
          </label>

          <label className="mt-3 block text-xs font-semibold text-slate-600">
            New password

            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={passwords.newPassword}
              required
              onChange={(event) =>
                setPasswords({
                  ...passwords,
                  newPassword: event.target.value,
                })
              }
            />
          </label>

          <button className="mt-4 rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
            Change password
          </button>

          {passwordMessage && (
            <p
              className="mt-3 text-sm text-slate-600"
              role="status"
            >
              {passwordMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}