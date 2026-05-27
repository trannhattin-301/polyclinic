import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  root: {
    flex: 1,
  },

  body: {
    flex: 1,
  },

  header: {
    height: 150,
    backgroundColor: 'dodgerblue',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingLeft: 15,
  },

  headerTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },

  searchBar: {
    height: 32,
  },

  searchInput: {
    fontSize: 10,
    minHeight: 0,
  },

  menuCard: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    elevation: 2,
  },

  menuCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },

  menuLabel: {
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },

  menuRow: {
    justifyContent: 'space-between',
  },
});