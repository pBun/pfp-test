async function main() {
    const ContractFactory = await ethers.getContractFactory("PFPTest");

    // Start deployment, returning a promise that resolves to a contract object
    const contractObj = await ContractFactory.deploy();
    await contractObj.deployed();
    console.log("Contract deployed to address:", contractObj.address);
}

main().then(() => process.exit(0)).catch((error) => {
    console.error(error)
    process.exit(1)
});
  