import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // All  screens

  container: {
    flex: 1,
    padding: 12,
    backgroundColor: 'white',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'black',
  },

  card: {
    marginBottom: 12,
    backgroundColor: 'white',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'black',
  },

  cardText: {
    fontSize: 14,
    marginBottom: 4,
    color: 'black',
  },

  input: {
    marginBottom: 10,
    backgroundColor: 'white',
  },

  chip: {
    alignSelf: 'flex-start',
    marginVertical: 8,
  },

  button: {
    marginTop: 12,
    backgroundColor: 'purple',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'black',
  },

  // DoctorHome.js

  logoutButton: {
    marginBottom: 20,
  },

  headerButtonText: {
    color: 'black',
  },

  //  DoctorAppointments.js

  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  rowButtonLeft: {
    flex: 1,
    marginRight: 6,
    backgroundColor: 'purple',
  },

  rowButtonRight: {
    flex: 1,
    marginLeft: 6,
    backgroundColor: 'purple',
  },

  // DoctorMedicalRecordCreate.js / DoctorAppointmentDetail.js

  loadingIcon: {
    marginTop: 10,
  },
});