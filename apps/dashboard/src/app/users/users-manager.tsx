"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
import { Badge, Button, Card, SelectInput, TextInput } from "@/components/ui";
import { ConfirmDialog } from "@/components/dialog";
import { CopyField } from "@/components/copy-field";
import { useToast } from "@/components/toast";
import { apiSend } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

export type Member = { id: string; email: string; name: string | null; role: string };

const ROLES = [
  { value: "owner", label: "مالك", hint: "كل الصلاحيات، ومنها إدارة المالكين" },
  { value: "admin", label: "مدير", hint: "تعديل المواقع ونشرها ودعوة المديرين والمشاهدين" },
  { value: "viewer", label: "مشاهد", hint: "عرض فقط دون تعديل" },
] as const;

const roleLabel = (role: string) => ROLES.find((r) => r.value === role)?.label ?? role;

const ERRORS: Record<string, string> = {
  "Email already in use": "هذا البريد مسجّل لمستخدم آخر.",
  "Organisation needs an owner": "يجب أن يبقى مالك واحد على الأقل.",
  "Cannot change your own membership": "لا يمكنك تغيير دورك أو حذف نفسك.",
  Forbidden: "ليست لديك صلاحية لهذا الإجراء.",
};

const message = (err: unknown, fallback: string) =>
  ERRORS[err instanceof Error ? err.message : ""] ?? errorMessage(err, fallback);

/** Mirrors the API rules so the page only offers what will be accepted. */
function canManage(me: Member, member: Member): boolean {
  if (me.id === member.id || me.role === "viewer") return false;
  return me.role === "owner" || member.role !== "owner";
}

export function UsersManager({ me, members }: { me: Member; members: Member[] }) {
  const router = useRouter();
  const toast = useToast();
  const invite = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("viewer");
  const [inviteError, setInviteError] = useState("");
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);

  const assignable = ROLES.filter((r) => me.role === "owner" || r.value !== "owner");

  function openInvite() {
    setEmail("");
    setName("");
    setRole("viewer");
    setInviteError("");
    setCreated(null);
    invite.current?.showModal();
  }

  async function submitInvite(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setInviteError("");
    try {
      const res = await apiSend<{ temporaryPassword: string }>("/v1/users", "POST", { email, name, role });
      setCreated({ email, password: res.temporaryPassword });
      router.refresh();
    } catch (err) {
      setInviteError(message(err, "تعذّرت إضافة المستخدم."));
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(member: Member, next: string) {
    setBusy(true);
    try {
      await apiSend(`/v1/users/${member.id}`, "PATCH", { role: next });
      toast(`أصبح ${member.name || member.email} ${roleLabel(next)}`);
      router.refresh();
    } catch (err) {
      toast(message(err, "تعذّر تغيير الدور."), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await apiSend(`/v1/users/${removing.id}`, "DELETE");
      toast(`حُذف ${removing.name || removing.email} من المؤسسة`);
      setRemoving(null);
      router.refresh();
    } catch (err) {
      toast(message(err, "تعذّر حذف المستخدم."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {me.role !== "viewer" && (
        <div className="flex justify-end">
          <Button icon={UserPlus} onClick={openInvite}>
            إضافة مستخدم
          </Button>
        </div>
      )}

      <Card className="p-0">
        <ul className="divide-y divide-ink-100">
          {members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-100 font-bold text-ink-700"
                >
                  {(m.name || m.email).trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-ink-900">
                    {m.name || m.email}
                    {m.id === me.id && <span className="ms-2 text-xs font-normal text-ink-500">(أنت)</span>}
                  </div>
                  <div className="truncate text-ink-500" dir="ltr">
                    {m.email}
                  </div>
                </div>
              </div>
              {canManage(me, m) ? (
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`دور ${m.name || m.email}`}
                    value={m.role}
                    disabled={busy}
                    onChange={(e) => void changeRole(m, e.target.value)}
                    className="rounded-lg border border-ink-300 bg-surface px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {assignable.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    aria-label={`حذف ${m.name || m.email}`}
                    disabled={busy}
                    onClick={() => setRemoving(m)}
                  />
                </div>
              ) : (
                <Badge tone={m.role === "viewer" ? "neutral" : "brand"}>{roleLabel(m.role)}</Badge>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <dialog
        ref={invite}
        aria-labelledby="invite-title"
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-ink-200 bg-surface p-0 text-ink-900 shadow-pop"
      >
        {created ? (
          <div>
            <div className="space-y-4 p-6">
              <h2 id="invite-title" className="text-lg font-bold">
                أُضيف المستخدم
              </h2>
              <p className="text-sm text-ink-600">
                أرسل كلمة المرور المؤقتة إلى <span dir="ltr">{created.email}</span> بطريقة آمنة. لن تظهر مرة أخرى،
                ويستطيع تغييرها من صفحة «حسابي» بعد الدخول.
              </p>
              <CopyField label="كلمة المرور المؤقتة" value={created.password} />
            </div>
            <div className="flex justify-end border-t border-ink-200 bg-ink-50 px-6 py-4">
              <Button type="button" onClick={() => invite.current?.close()}>
                تم
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submitInvite}>
            <div className="space-y-4 p-6">
              <h2 id="invite-title" className="text-lg font-bold">
                إضافة مستخدم
              </h2>
              <TextInput
                label="البريد الإلكتروني"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
              <TextInput label="الاسم (اختياري)" value={name} onChange={(e) => setName(e.target.value)} />
              <SelectInput label="الدور" value={role} onChange={(e) => setRole(e.target.value)}>
                {assignable.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}: {r.hint}
                  </option>
                ))}
              </SelectInput>
              {inviteError && (
                <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
                  {inviteError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-ink-200 bg-ink-50 px-6 py-4">
              <Button type="button" variant="secondary" onClick={() => invite.current?.close()}>
                إلغاء
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "جارٍ الإضافة…" : "إضافة"}
              </Button>
            </div>
          </form>
        )}
      </dialog>

      <ConfirmDialog
        open={removing !== null}
        title={`حذف ${removing?.name || removing?.email || ""}؟`}
        confirmLabel="حذف المستخدم"
        tone="danger"
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={() => void remove()}
      >
        يفقد الوصول إلى اللوحة فوراً. تبقى النسخ التي نشرها في السجل دون اسمه.
      </ConfirmDialog>
    </>
  );
}
