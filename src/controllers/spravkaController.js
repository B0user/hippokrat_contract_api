const {Spravka} = require('../models/Schemas');

const createSpravka = async (req, res) => {
    const {date,type,patient_iin,patient_firstname,patient_secondname,patient_middlename,doctor_name} = req.body;
    if (!date || !type || !patient_iin || !patient_firstname || !patient_secondname || !patient_middlename || !doctor_name)
        return res.status(400).json({ error:'Incomplete req body'});
    try {
        const spravka = new Spravka({date,type,patient_iin,patient_firstname,patient_secondname,patient_middlename,doctor_name});
        const savedSpravka = await spravka.save();
        // add the spravka to the doctor's list?
        res.status(201).json(savedSpravka);

    } catch (err) {
        res.status(500).json({ error: 'An error occured creating a spravka'});
    }
}

const getSpravka = async (req, res) => {
    const spravkaID = req.params.id;
    if (!spravkaID) 
        return res.status(400).json({ error:'SpravkaID empty'});
    try {
        const foundSpravka = await Spravka.findById(spravkaID);
        if (!foundSpravka)
            return res.status(404).json({ error:'Spravka not found'});
        let resSpravka = {
            date: foundSpravka.date,
            type: foundSpravka.type,
            patient_iin: `${foundSpravka.patient_iin.substring(0, 4)}********`,
            patient_name: `${foundSpravka.patient_secondname} ${foundSpravka.patient_firstname.charAt(0)}. ${foundSpravka.patient_middlename.charAt(0)}.`,
            doctor_name: foundSpravka.doctor_name
        }
        res.json(resSpravka);
    } catch (err) {
        res.status(500).json({ error: 'An error occured getting a spravka'});
    }
}

const getAllSpravkas = async (req, res) => {
    const doctorName = req.user?.fullname;
    if (!doctorName) 
        return res.status(400).json({ error: 'DoctorName empty' });

    try {
        const spravkas = await Spravka.find({ doctor_name: doctorName });
        if (!spravkas.length) return res.json([]); // Return an empty array instead of a 404 error

        const responseSpravkas = spravkas.map(spravka => ({
            id: spravka._id,
            date: spravka.date,
            type: spravka.type,
            patient_iin: spravka.patient_iin,
            patient_name: `${spravka.patient_secondname} ${spravka.patient_firstname} ${spravka.patient_middlename}`,
            doctor_name: spravka.doctor_name
        }));

        res.json(responseSpravkas);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred getting a spravka' });
    }
};





module.exports = {
    createSpravka,
    getSpravka,
    getAllSpravkas
};