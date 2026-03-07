const { execSync } = require("child_process");

function banner(title){
    console.log("\n===================================================");
    console.log(title);
    console.log("===================================================");
}

function runStep(stepName, command){
    console.log(`\nTest: ${stepName}`); //Prints the step name
    console.log(`\nCommand: ${command}`); //Prints command being executed
    execSync(command, { stdio: "inherit" }); //Sends the command's output onto GitHub log.
    console.log("\n///////////////////////////////////////////////////////////////////////\n")
}

function main(){
    banner("AUTO TEST SUITE RUNNING");

    runStep("Lint (Expo ESLint)", "npm run lint");
    runStep("Build Export (Expo export)", "npm run test:build");

    //(UNCOMMENT TO USE)
    //Test to verify the FAILED tests are correctly logged.
    //runStep("Intentional failure test", "node -e \"process.exit(1)\"");

    banner("AUTO TEST SUITE PASSED");
}

try{
    main();
    process.exit(0);
}catch (e){
    banner("AUTO TEST SUITE FAILED");

    //Generates timestamp
    const timestamp= new Date().toISOString();
    console.error(`\nTimestamp: ${timestamp}`);
    
    //Logic for lvl identificaiton is in TBD
    //Logs the level (INFO/ERROR/FATAL)

    //Error message
    console.error(`\nError message: \n${e?.message ?? e}`);

    //Logs defect source
    console.error(`\nSource: \n${e.stack}`);


    process.exit(1);
}