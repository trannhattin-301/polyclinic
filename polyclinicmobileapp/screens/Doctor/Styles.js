import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },

  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },

  button: {
    marginTop: 10,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777',
  },
});