exports.getDayName = getDayName;

function getDayName () {
    let format = { weekday: 'long', day: 'numeric', month: 'long'};
    return new Date().toLocaleDateString("en-US", format);
}