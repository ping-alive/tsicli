import { tsicli } from ".";

tsicli(process.argv, {
  types: {
    "#smdId": {
      type: "autocomplete",
      name: "#smdId",
      message: "Please input #smdId",
      choices: [
        { title: "Brand", value: "Brand" },
        { title: "Category", value: "Category" },
        { title: "Product", value: "Product" },
      ],
    },
    "#recordId": "number",
    "#recordIds": "number[]",
    "#name": "string",
    "#yesOrNo": "boolean",
  },
  args: [
    ["practice_boolean", "#yesOrNo"],
    ["practice_number", "#recordId"],
    ["practice_numbers", "#recordIds"],
    ["fixture", "sync"],
    ["fixture", "import", "#smdId", "#recordIds"],
    ["migrate", "run"],
    ["migrate", "rollback"],
    ["migrate", "clear"],
    ["migrate", "reset"],
    ["stub", "practice", "#name"],
    ["stub", "smd", "#smdId"],
    ["scaffold", "model", "#smdId"],
    ["scaffold", "model_test", "#smdId"],
  ],
  runners: {
    practice_boolean,
    practice_number,
    practice_numbers,
    fixture_sync,
    fixture_import,
    migrate_run,
    migrate_rollback,
    migrate_clear,
    migrate_reset,
    stub_practice,
    stub_smd,
    scaffold_model,
    scaffold_model_test,
  },
});

async function fixture_sync() {
  console.log("RUN fixture sync");
}
async function fixture_import(smdId: string, recordIds: number) {
  console.log(`RUN fixture import ${smdId} ${recordIds}`);
}
async function migrate_run() {
  console.log("RUN migrate run");
}
async function migrate_rollback() {
  console.log("RUN migrate_rollback");
}
async function migrate_clear() {
  console.log("RUN migrate_clear");
}
async function migrate_reset() {
  console.log("RUN migrate_reset");
}
async function stub_practice(name: string) {
  console.log(`RUN stub_practice ${name}`);
}
async function stub_smd(smdId: string) {
  console.log(`RUN stub_smd ${smdId}`);
}
async function scaffold_model(smdId: string) {
  console.log(`RUN scaffold_model ${smdId}`);
}
async function scaffold_model_test(smdId: string) {
  console.log(`RUN scaffold_model_test ${smdId}`);
}
async function practice_boolean(yesOrNo: boolean) {
  console.log(`RUN practice_boolean ${yesOrNo}`);
}
async function practice_number(recordId: number) {
  console.log(`RUN practice_number ${recordId}`);
  console.log(`RUN typeof recordId is ${typeof recordId}`);
}
async function practice_numbers(recordIds: number[]) {
  console.log(`RUN practice_numbers ${recordIds}`);
  console.log(`RUN typeof recordIds[0] is ${typeof recordIds[0]}`);
}
