const { Contract } = require('../models/Schemas');

// Create a new contract
const createContract = async (req, res) => {
    
    const doctorName = req.user?.fullname;
    if (!doctorName) 
        return res.status(400).json({ error: 'DoctorName empty' });

    const { company_enroller, patients, date_of_contract } = req.body;
    if (!company_enroller || !patients || !date_of_contract) {
        return res.status(400).json({ message: 'Company, patients, and contract date are required.' });
    }

    try {
        // Check if a contract with the same company and date already exists
        const existingContract = await Contract.findOne({
            company_enroller,
            date_of_contract
        });

        if (existingContract) {
            return res.status(409).json({ message: 'Contract for this company and date already exists.' });
        }

        const newContract = new Contract({
            company_enroller,
            patients,
            date_of_contract,
            date_added: Date.now(),
            date_updated: Date.now()
        });
        const savedContract = await newContract.save();
        res.status(201).json(savedContract);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all contracts
const getAllContracts = async (req, res) => {
    try {
        const contracts = await Contract.find();
        res.status(200).json(contracts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all contracts
const getAllContractCompanies = async (req, res) => {
    try {
        const contracts = await Contract.find();
        const companies = contracts.map(contract => contract.company_enroller);
        res.status(200).json(companies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a specific contract by ID
const getContractById = async (req, res) => {
    const { id } = req.params;

    try {
        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }
        res.status(200).json(contract);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a specific contract by ID
const updateContractById = async (req, res) => {
    
    const doctorName = req.user?.fullname;
    if (!doctorName) 
        return res.status(400).json({ error: 'DoctorName empty' });

    const { id } = req.params;
    const { company_enroller, patients, date_of_contract } = req.body;
    try {
        const contract = await Contract.findById(id);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }
        console.log(contract);

        contract.company_enroller = company_enroller || contract.company_enroller;
        contract.patients = patients || contract.patients;
        contract.date_of_contract = date_of_contract || contract.date_of_contract;
        contract.date_updated = Date.now();

        contract.patients.forEach(patient => {
            patient.change_history.push({
                doctor_name: doctorName,
                change_date: Date.now(),
                change_description: `Updated contract fields: ${Object.keys(req.body).join(', ')}`
            });
        });

        console.log(contract);


        const updatedContract = await contract.save();
        res.status(200).json(updatedContract);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateOnePatientAssigned = async (req, res) => {

    
    const doctorName = req.user?.fullname;
    if (!doctorName) 
        return res.status(400).json({ error: 'DoctorName empty' });

    const { contractId, patientId } = req.params;
    const { assigned } = req.body;  // assigned come as an object {Терапевт: '2024-07-11', ...}


    try {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }

        const patient = contract.patients.id(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        patient.assigned = assigned;
        patient.date_updated = Date.now();
        contract.date_updated = Date.now();


        patient.change_history.push({
            doctor_name: doctorName,
            change_date: Date.now(),
            change_description: `Updated assigned procedures: ${JSON.stringify(assigned)}`
        });

        await contract.save();
        res.status(200).json({ message: 'Assigned procedures updated successfully', patient });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};

const updateOnePatientComment = async (req, res) => {
    const doctorName = req.user?.fullname;
    const doctorRole = req.user?.role;
    if (!doctorName || !doctorRole)
        return res.status(400).json({ error: 'DoctorName empty' });

    const { contractId, patientId } = req.params;
    const { comment_content } = req.body;

    if (!comment_content) 
        return res.status(400).json({ error: 'Comment content empty' });

    try {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }

        const patient = contract.patients.id(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        patient.date_updated = Date.now();
        contract.date_updated = Date.now();


        // Patient Comment find ?
        let commentExists = false;

        patient.comments = patient.comments.map(comment => {
            if (comment.doctor_name === doctorName) {
                comment.comment_content = comment_content;
                comment.comment_date = Date.now();
                commentExists = true;
            }
            return comment;
        });

        if (!commentExists) {
            patient.comments.push({
                doctor_name: doctorName,
                doctor_role: doctorRole,
                comment_date: Date.now(),
                comment_content
            });
        }      

        patient.change_history.push({
            doctor_name: doctorName,
            change_date: Date.now(),
            change_description: `Updated comment`
        });

        await contract.save();
        res.status(200).json({ message: 'Comment added successfully', patient });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};


const updateOnePatientInfo = async (req, res) => {
    const doctorName = req.user?.fullname;
    const doctorRole = req.user?.role;
    
    if (!doctorName || !doctorRole)
        return res.status(400).json({ error: 'DoctorName empty' });

    const { contractId, patientId } = req.params;
    const { patient_info } = req.body;

    if (!patient_info) 
        return res.status(400).json({ error: 'Comment content empty' });

    try {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }

        const patient = contract.patients.id(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        patient.date_updated = Date.now();
        contract.date_updated = Date.now();


        patient.fullname = patient_info.fullname;
        patient.iin = patient_info.iin;
        patient.dob = patient_info.dob;
        patient.position = patient_info.position;
        patient.gender = patient_info.gender;

        patient.change_history.push({
            doctor_name: doctorName,
            change_date: Date.now(),
            change_description: `Updated general info`
        });

        await contract.save();
        res.status(200).json({ message: 'Comment added successfully', patient });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
    }
};


// Delete a specific contract by ID
const deleteContractById = async (req, res) => {
    const { id } = req.params;

    try {
        const contract = await Contract.findByIdAndDelete(id);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }
        res.status(200).json({ message: 'Contract deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addPatientToContract = async (req, res) => { // Make a check for gender and change the way it gets procedures
    const { company_enroller, patient } = req.body;

    if (!company_enroller || !patient) {
        return res.status(400).json({ message: 'Company enroller and patient details are required.' });
    }

    try {
        const contract = await Contract.findOne({ company_enroller });

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }



        const existingPatient = contract.patients.find(p => p.iin === patient.iin);
        
        if(existingPatient){
            existingPatient.assigned.set('Регистратор', new Date());
            existingPatient.date_updated = new Date();

            
            contract.date_updated = new Date();
            const updatedContract = await contract.save();

            res.status(409).json(updatedContract);

        }
        else {
            // Get the assigned procedures from the first patient in the contract
        let assignedProceduresTemplate = {
            'Регистратор': null,
            'Терапевт': null,
            'Офтальмолог (окулист)': null,
            'Отоларинголог (ЛОР)': null,
            'Хирург': null,
            'Невролог': null,
            'Гинеколог (для женщин)': null
        };
        // if (contract.patients.length > 0) {
        //     contract.patients[0].assigned.forEach((value, key) => {
        //         assignedProceduresTemplate[key] = value;
        //     });
        // }

        
        // // Create a new assigned procedures map with all values set to null, except 'Регистратор' set to the current date
        // const assignedProcedures = new Map();
        // Object.keys(assignedProceduresTemplate).forEach(key => {
        //     assignedProcedures.set(key, key === 'Регистратор' ? new Date() : null);
        // });

        assignedProceduresTemplate.reduce((acc, procedure) => {
            if (!(patient.gender === 'Мужской' && procedure === 'Гинеколог (для женщин)')) {
                acc[procedure] = null;
            }
            return acc;
        });

        contract.patients.push({
            iin: patient.iin,
            fullname: patient.fullname,
            dob: patient.dob,
            gender: patient.gender,
            position: patient.position,
            assigned: assignedProceduresTemplate,
            date_added: new Date(),
            date_updated: new Date()
        });

        contract.date_updated = new Date();
        const updatedContract = await contract.save();

        res.status(200).json(updatedContract);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

// Search patients by IIN or full name
const searchPatients = async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required.' });
    }

    try {
        const contracts = await Contract.find({
            $or: [
                { "patients.iin": query },
                { "patients.fullname": new RegExp(query, 'i') } // Case insensitive search
            ]
        });

        const patients = contracts.flatMap(contract =>
            contract.patients
                .filter(patient =>
                    patient.iin === query || patient.fullname.toLowerCase().includes(query.toLowerCase())
                )
                .map(patient => ({
                    ...patient.toObject(),
                    assigned: Object.fromEntries(patient.assigned), // Convert Map to object
                    company_enroller: contract.company_enroller,
                    date_of_contract: contract.date_of_contract,
                    contract_id: contract._id
                }))
        );

        res.status(200).json(patients);
    } catch (err) {
        console.error('Error occurred:', err.message);
        res.status(500).json({ message: err.message });
    }
};


module.exports = {
    createContract,
    getAllContracts,
    getContractById,
    updateContractById,
    deleteContractById,
    addPatientToContract,
    searchPatients,
    updateOnePatientAssigned,
    updateOnePatientComment,
    updateOnePatientInfo,
    getAllContractCompanies
};
