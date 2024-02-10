const Label = require("../Model/Labels");
const User = require("../Model/User");

module.exports = async (req, res, next) => {
    const labelId = req.body.labelId;

    // check if label id is empty
    if(!labelId){
        const error = new Error("Label Id cannot be null");
        error.status = 400;
        return next(error);
    }
    try {
        const user = await User.findById(req.userId);
        const labelInUser = user.labels.filter(label => label.toString() === labelId.toString())[0];
        
        if(!labelInUser){
            throw new Error();
        }
        const label = await Label.findById(labelId);
        req.label = label;
        next();

    } catch (error) {
        error.message = "Invalid Label Id",
        error.status = 400;
        next(error);
    }
}