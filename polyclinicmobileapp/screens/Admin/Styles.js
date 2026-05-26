import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 12,
        backgroundColor: '#f5f5f5',
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loadingText: {
        marginTop: 8,
    },

    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 8,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    card: {
        width: '48%',
        marginBottom: 12,
        borderRadius: 12,
    },

    cardTitle: {
        fontSize: 15,
        color: '#555',
    },

    cardNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 8,
    },

    statusCard: {
        marginBottom: 10,
        borderRadius: 12,
    },

    statusContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    statusTitle: {
        fontSize: 15,
    },

    statusNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logoutButton: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 8,
},
});