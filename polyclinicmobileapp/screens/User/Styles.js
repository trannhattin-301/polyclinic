import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 12,
    marginBottom: 8,
  },
  linkRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    color: '#2563EB',
    fontSize: 14,
  },
  header: {
    backgroundColor: '#1E88E5',
    paddingTop: 50,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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

  // Profile.js
  profileContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarButton: {
    marginTop: 12,
  },
  profileInput: {
    marginBottom: 10,
  },
});