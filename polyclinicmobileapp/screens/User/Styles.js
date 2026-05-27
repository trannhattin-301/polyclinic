import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // All, Login, Register
  container: {
    flexGrow: 1,
    backgroundColor: 'whitesmoke',
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: 'dimgray',
  },

  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },

  button: {
    marginTop: 8,
    marginBottom: 8,
  },

  linkRow: {
    alignItems: 'center',
    marginTop: 16,
  },

  linkText: {
    color: 'blue',
    fontSize: 14,
  },

  header: {
    backgroundColor: 'dodgerblue',
    paddingTop: 50,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 8,
  },

  name: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  email: {
    color: 'white',
    fontSize: 13,
  },

  content: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    padding: 16,
  },

  card: {
    marginBottom: 12,
    borderRadius: 12,
  },

  menuCard: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    elevation: 2,
  },

  profileContainer: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },

  profileInput: {
    marginBottom: 8,
    backgroundColor: 'white',
  },

  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },

  avatarButton: {
    marginTop: 4,
  },

  // Account
    primaryButton: {
    marginTop: 8,
    marginBottom: 8,
  },

  outlineButton: {
    marginTop: 8,
    marginBottom: 8,
  },

  dangerButton: {
    marginTop: 8,
    marginBottom: 8,
  },

  // Profile
    root: {
    flex: 1,
  },

  flexScroll: {
    flexGrow: 1,
  },
});