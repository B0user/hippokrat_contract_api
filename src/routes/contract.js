const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const verifyRoles = require('../middleware/verifyRoles');

router.post('/', verifyRoles('admin'),contractController.createContract);
router.get('/', verifyRoles('admin', 'therapist'), contractController.getAllContracts);
router.get('/companies', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), contractController.getAllContractCompanies);
router.get('/search-patient', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), contractController.searchPatients); 
router.put('/add-patient', verifyRoles('registrator'), contractController.addPatientToContract);
router.patch('/:contractId/patients/:patientId/procedures', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), contractController.updateOnePatientAssigned);
router.patch('/:contractId/patients/:patientId/comment', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'),contractController.updateOnePatientComment);
router.patch('/:contractId/patients/:patientId/info', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), contractController.updateOnePatientInfo);

router.get('/:id', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), contractController.getContractById);
router.put('/:id', verifyRoles('registrator', 'therapist', 'admin', 'ophthalmologist', 'otolaryngologist', 'surgeon', 'neurologist', 'gynecologist'), contractController.updateContractById);
router.delete('/:id', verifyRoles('therapist', 'admin'), contractController.deleteContractById);

// router.delete('/delete-patient', contractController.deletePatient);

module.exports = router;
