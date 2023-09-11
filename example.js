if (!require.cache) {
    throw new Error("No require.cache");
} else {
    console.log("require.cache exists")
}