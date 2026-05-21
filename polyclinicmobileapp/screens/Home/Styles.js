import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    header: {
        height: 150,
        backgroundColor: '#1E88E5',
        justifyContent: 'flex-start', // đẩy lên trên
        alignItems: 'flex-start',     // đẩy sang trái

        paddingTop: 50,
        paddingLeft: 15,
    },

    headerTitle: {
        color: '#fff',
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
