const express = require('express');
const router = express.Router();
const strahovkaController = require('../controllers/strahovkaController');
const verifyRoles = require('../middleware/verifyRoles');

router.post('/', verifyRoles('admin'),strahovkaController.createContract);
router.get('/', verifyRoles('admin', 'therapist'), strahovkaController.getAllContracts);
router.get('/companies', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), strahovkaController.getAllContractCompanies);
router.get('/search-patient', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), strahovkaController.searchPatients); 
router.put('/add-patient', verifyRoles('registrator'), strahovkaController.addPatientToContract);
router.patch('/:contractId/patients/:patientId/procedures', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), strahovkaController.updateOnePatientAssigned);
router.patch('/:contractId/patients/:patientId/comment', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'),strahovkaController.updateOnePatientComment);
router.patch('/:contractId/patients/:patientId/info', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), strahovkaController.updateOnePatientInfo);

router.get('/:id', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), strahovkaController.getContractById);
router.put('/:id', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), strahovkaController.updateContractById);
router.delete('/:id', verifyRoles('therapist', 'admin'), strahovkaController.deleteContractById);

// router.delete('/delete-patient', strahovkaController.deletePatient);

module.exports = router;
