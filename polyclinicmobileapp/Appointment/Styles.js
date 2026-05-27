import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  //All
  root: {
    flex: 1,
  },

  loading: {
    marginTop: 20,
  },

  listContent: {
    paddingBottom: 10,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
  },

  searchBar: {
    height: 32,
  },

  searchInput: {
    fontSize: 10,
    minHeight: 0,
  },

  container: {
    flex: 1,
    padding: 10,
  },

  infoCard: {
    marginBottom: 15,
  },

  sectionTitle: {
    marginBottom: 10,
  },

  confirmButton: {
    marginTop: 20,
  },

  //  SelectSpecialty.js, SelectDoctor.js 
  listCard: {
    marginHorizontal: 10,
    marginVertical: 6,
  },

  screenTitle: {
    margin: 10,
  },

  //SelectSchedule.js 
  scheduleContent: {
    padding: 10,
    paddingBottom: 30,
  },

  timeSlotWrapper: {
    marginTop: 15,
  },

  emptySmallText: {
    textAlign: 'center',
    marginTop: 10,
  },

  emptyDateText: {
    textAlign: 'center',
    marginTop: 15,
  },

  slotButton: {
    flex: 1,
    margin: 5,
  },

  //MyAppointments.js 
  appointmentContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'skyblue',
  },

  appointmentCard: {
    marginVertical: 6,
    padding: 6,
    backgroundColor: 'white',
  },

  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  pageTitle: {
    marginBottom: 12,
  },

  smallButton: {
    marginTop: 6,
  },

  //Chat.js
  chatContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: 'whitesmoke',
  },

  chatInfoCard: {
    marginBottom: 10,
  },

  chatEmptyContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },

  chatEmptyText: {
    textAlign: 'center',
    marginBottom: 12,
  },

  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  chatInput: {
    flex: 1,
    backgroundColor: 'white',
  },

  sendButton: {
    marginLeft: 8,
  },

  myMessageRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },

  otherMessageRow: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  myMessageBox: {
    maxWidth: '78%',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'dodgerblue',
  },

  otherMessageBox: {
    maxWidth: '78%',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'lightgray',
  },

  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  myMessageText: {
    color: 'white',
  },

  otherMessageText: {
    color: 'black',
  },

  myMessageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: 'white',
  },

  otherMessageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
    color: 'dimgray',
  },

  // SelectSchedule
  errorContainer: {
    flex: 1,
    padding: 20,
  },

  errorButton: {
    marginTop: 20,
  },
});