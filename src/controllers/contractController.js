const { Contract } = require('../models/Schemas');

// Create a new contract
const createContract = async (req, res) => {

    const doctorName = req.user?.fullname;
    if (!doctorName)
        return res.status(400).json({ error: 'DoctorName empty' });

    const { company_enroller, patients, date_of_contract, procedures_by_contract } = req.body;
    if (!company_enroller || !patients || !date_of_contract || !procedures_by_contract) {
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
            date_updated: Date.now(),
            procedures_by_contract
        });
        const savedContract = await newContract.save();

        res.status(201).json(savedContract);
    } catch (err) {
        console.log(err);
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
    const { assigned } = req.body; // assigned comes as an array of objects [{procedure: 'name', doctor: 'specialist', gender: '', date: '2024-07-11'}]

    try {
        const contract = await Contract.findById(contractId);
        if (!contract) {
            return res.status(404).json({ message: 'Contract not found.' });
        }

        const patient = contract.patients.id(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        // Validate and update `assigned`
        if (!Array.isArray(assigned)) {
            return res.status(400).json({ message: '`assigned` must be an array of procedures.' });
        }

        // Ensure all assigned procedures have the required structure
        const validAssigned = assigned.map(item => ({
            procedure: item.procedure || 'Unknown Procedure',
            doctor: item.doctor || null,
            gender: item.gender || null,
            date: item.date ? new Date(item.date) : null, // Convert date strings to Date objects
        }));

        patient.assigned = validAssigned; // Assign the validated array
        patient.date_updated = Date.now();
        contract.date_updated = Date.now();

        patient.change_history.push({
            doctor_name: doctorName,
            change_date: Date.now(),
            change_description: `Updated assigned procedures: ${JSON.stringify(validAssigned)}`
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



        const existingPatient = contract.patients.find(p => p.iin === patient.iin || p.fullname === patient.fullname);

        if(existingPatient){
            const registratorProcedure = existingPatient.assigned.find(
                procedure => procedure.procedure === 'Регистратор'
            );

            if (registratorProcedure) {
                registratorProcedure.date = new Date();
            }

            existingPatient.date_updated = new Date();
            contract.date_updated = new Date();
            const updatedContract = await contract.save();
            res.status(409).json(updatedContract);

        }
        else {
            const assignedProcedures = contract.procedures_by_contract
                .filter(procedure => (!procedure.gender || procedure.gender === patient.gender))
                .map(procedure => ({
                    ...procedure,
                    date: procedure.procedure === 'Регистратор' ? new Date() : null, // Set date for 'Регистратор'
                 
            }));

            contract.patients.push({
                iin: patient.iin,
                fullname: patient.fullname,
                dob: patient.dob,
                gender: patient.gender,
                position: patient.position,
                assigned: assignedProcedures,
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
                    assigned: patient.assigned,
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
