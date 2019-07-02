function response(data, message) {
    return {
        data: data || [],
        message: message || ''
    }
}

module.exports = {
    response
};
