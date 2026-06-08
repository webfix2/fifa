import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faPaperPlane, faTicketAlt, faPlus, faTimesCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import AddUserModal from './AddUserModal';
import { User, Ticket } from '../types';
import { useUser } from '../UserContext';

interface NewUserFormData {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  seatNumbers: string;
  transferringSeatNumbers: string;
  senderName: string;
  senderEmail: string;
  userPlatform: string;
  sendType: string;
}

interface UserTableProps {
  users: User[];
  tickets: Ticket[];
}

const UserTable: React.FC<UserTableProps> = ({ users, tickets }) => {
  const { fetchAllUsers } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserFormData, setNewUserFormData] = useState<NewUserFormData>({
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    seatNumbers: '',
    transferringSeatNumbers: '',
    senderName: '',
    senderEmail: '',
    userPlatform: 'ticketmaster',
    sendType: 'draft',
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  const APP_SCRIPT_POST_URL = process.env.NEXT_PUBLIC_APP_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbxcoCDXcWlKPDbttlFf2eR_EeuMkfupy5dfgIOklM1ShEZ30gfD3wzZZOxkKV4xIWEl/exec";

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
  };

  const filteredUsers = users.filter(user => {
    const searchString = `${user.fullName} ${user.phoneNumber} ${user.emailAddress} ${user.ticketFolderId} ${user.eventName} ${user.section} ${user.adminStatus}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleRetractTransfer = useCallback((user: User) => {
    if (window.confirm("Are you sure you want to retract this ticket transfer?")) {
      setIsActionLoading(true);

      let payload = new URLSearchParams();
      payload.append("action", "retractTicket");
      payload.append("userId", user?.userId as string);
      payload.append("cancelledSTAMP", "RETRACTED");

      fetch(APP_SCRIPT_POST_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: payload.toString()
      }).then(() => {
        setTimeout(() => {
          fetchAllUsers(); // Refresh users list
          setIsActionLoading(false);
        }, 1000);
      }).catch(error => {
        console.error("Error retracting ticket:", error);
        fetchAllUsers(); // Refresh users list
        setIsActionLoading(false);
      });
    }
  }, [APP_SCRIPT_POST_URL, fetchAllUsers]);

  return (
    <>
      <section className="bg-[#1F1F1F] p-6 rounded-2xl shadow-2xl border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h3 className="text-xl font-black text-white tracking-tight uppercase tracking-widest text-xs opacity-40">Transfer Management</h3>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search transfers..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full p-3 pl-10 bg-white/5 border border-white/5 rounded-xl text-white placeholder-white/20 font-bold text-xs outline-none focus:bg-white/10 transition-all"
              />
              <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs" />
            </div>
            <button
              onClick={handleAddUser}
              className="bg-[#026CDF] hover:scale-[1.02] active:scale-[0.98] text-white px-6 py-3 rounded-xl flex items-center w-full sm:w-auto justify-center font-black text-xs uppercase tracking-widest shadow-lg shadow-[#026CDF]/20 transition-all"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Send Ticket
            </button>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6 scrollbar-hide">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="py-4 px-2 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">Full Name</th>
                <th className="py-4 px-2 text-[10px] font-black text-white/40 uppercase tracking-widest text-left hidden lg:table-cell">Event</th>
                <th className="py-4 px-2 text-[10px] font-black text-white/40 uppercase tracking-widest text-left hidden lg:table-cell">Section</th>
                <th className="py-4 px-2 text-[10px] font-black text-white/40 uppercase tracking-widest text-left">Status</th>
                <th className="py-4 px-2 text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.reverse().map(user => (
                <tr key={user.userId} className="hover:bg-white/5 transition-colors group">
                  <td className="py-4 px-2">
                    <p className="text-sm font-black text-white">{user.fullName}</p>
                    <p className="text-[10px] font-bold text-white/30 truncate max-w-[150px]">{user.emailAddress}</p>
                  </td>
                  <td className="py-4 px-2 text-sm font-bold text-white/60 hidden lg:table-cell">{user.eventName}</td>
                  <td className="py-4 px-2 text-sm font-bold text-white/60 hidden lg:table-cell">{user.section}</td>
                  <td className="py-4 px-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        user.systemStatus === 'COMPLETED'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : user.systemStatus === 'WAITING APPROVAL' || user.systemStatus === 'WAITING COMPLETION'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-white/5 text-white/40 border-white/10'
                      }`}
                    >
                      {user.systemStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center justify-center space-x-4">
                      {user.ticketFolderId && (
                        <a
                          href={`https://drive.google.com/drive/folders/${user.ticketFolderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#026CDF] hover:text-white transition-colors"
                          title="Open Folder"
                        >
                          <FontAwesomeIcon icon={faFolderOpen} />
                        </a>
                      )}
                      {['WAITING APPROVAL', 'WAITING COMPLETION', 'COMPLETED'].includes(user.systemStatus) && (
                        <button
                          onClick={() => handleRetractTransfer(user)}
                          disabled={isActionLoading}
                          className="text-red-500 hover:text-white transition-colors"
                          title="Retract Transfer"
                        >
                          {isActionLoading ? <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" /> : <FontAwesomeIcon icon={faTimesCircle} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faSearch} className="text-white/10 text-4xl mb-4" />
            <p className="text-white/40 font-bold text-sm">No transfers found matching your search.</p>
          </div>
        )}
      </section>

      {showAddUserModal && (
        <AddUserModal
          tickets={tickets}
          formData={newUserFormData}
          setFormData={setNewUserFormData}
          onAddUser={fetchAllUsers}
          onClose={() => setShowAddUserModal(false)}
        />
      )}
    </>
  );
};

export default UserTable;
