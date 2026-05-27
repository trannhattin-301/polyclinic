import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 14,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 14,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#aaa',
  },

  // Group card
  card: {
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E88E5',
  },
  cardDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    padding: 8,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  viewDetail: {
    color: '#1E88E5',
    fontSize: 13,
    fontWeight: '600',
  },

  // Detail view
  detailContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E88E5',
  },
  closeBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeBtnText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },

  // Item card inside detail
  itemCard: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: '#FAFAFA',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  dosageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dosageItem: {
    width: '48%',
    backgroundColor: '#F0F4F8',
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
    marginRight: '2%',
  },
  dosageLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 1,
  },
  dosageValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  itemNote: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
});