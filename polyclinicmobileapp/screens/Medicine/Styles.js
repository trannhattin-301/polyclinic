import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
  },
  search: {
    marginBottom: 12,
  },
  loader: {
    marginTop: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 10,
  },
  listContainer: {
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dropdownButton: {
    alignSelf: 'flex-start',
    flex: 1,
  },
  historyButton: {
    marginLeft: 12,
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    marginTop: 10,
  },
});
