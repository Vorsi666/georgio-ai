/**
 * Security rules simulation for `georgio_memory`.
 * Verifies the expression denies the attacks that matter, before we ship it.
 */

const OPENID_A = "openid_AAA";
const OPENID_B = "openid_BBB";

function evaluate(rule, ctx) {
  const { auth, doc } = ctx;
  // Mirrors the CloudBase rules grammar we support.
  const vars = { auth, doc };
  const normalized = rule
    .replace(/doc\._openid/g, JSON.stringify(doc?._openid ?? null))
    .replace(/auth\.openid/g, JSON.stringify(auth?.openid ?? null))
    .replace(/\bauth\b/g, auth === null ? "null" : JSON.stringify(auth))
    .replace(/\bdoc\b/g, JSON.stringify(doc));
  try {
    // eslint-disable-next-line no-new-func
    return Function("auth", "doc", `return (${normalized});`)(vars.auth, vars.doc);
  } catch {
    return "ERROR";
  }
}

const rules = {
  read: "auth != null && doc._openid == auth.openid",
  create: "auth != null && doc._openid == auth.openid",
  update: "auth != null && doc._openid == auth.openid",
  delete: "auth != null && doc._openid == auth.openid",
};

const cases = [
  { name: "anon reads someone else's doc", rule: "read", auth: null, doc: { _openid: OPENID_A }, expect: false },
  { name: "anon reads own doc (never possible)", rule: "read", auth: null, doc: { _openid: null }, expect: false },
  { name: "A reads A's doc", rule: "read", auth: { openid: OPENID_A }, doc: { _openid: OPENID_A }, expect: true },
  { name: "A reads B's doc  <-- exfiltration", rule: "read", auth: { openid: OPENID_A }, doc: { _openid: OPENID_B }, expect: false },
  { name: "A creates doc claiming B's openid <-- forgery", rule: "create", auth: { openid: OPENID_A }, doc: { _openid: OPENID_B }, expect: false },
  { name: "A creates doc with own openid", rule: "create", auth: { openid: OPENID_A }, doc: { _openid: OPENID_A }, expect: true },
  { name: "A updates B's doc", rule: "update", auth: { openid: OPENID_A }, doc: { _openid: OPENID_B }, expect: false },
  { name: "A deletes B's doc", rule: "delete", auth: { openid: OPENID_A }, doc: { _openid: OPENID_B }, expect: false },
  { name: "A deletes A's doc", rule: "delete", auth: { openid: OPENID_A }, doc: { _openid: OPENID_A }, expect: true },
];

let failed = 0;
for (const c of cases) {
  const got = evaluate(rules[c.rule], { auth: c.auth, doc: c.doc });
  const ok = got === c.expect;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${c.rule.padEnd(6)} ${c.name.padEnd(46)} got=${got} want=${c.expect}`);
}

console.log(failed === 0 ? "\nAll rules behave correctly." : `\n${failed} rule(s) failed.`);
process.exit(failed === 0 ? 0 : 1);