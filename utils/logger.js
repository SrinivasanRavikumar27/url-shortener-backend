// console.log and console.error make custom here
const Info = (...params) => {
    console.log(...params);
};

const Error = (...params) => {
    console.error(...params);
};

// export
module.exports = {
    Info,
    Error
};