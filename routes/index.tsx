import { Head } from "fresh/runtime";
import { define } from "../utils.ts";
import DinosaurBrowser from "../islands/DinosaurBrowser.tsx";
import ClusterStatus from "../islands/ClusterStatus.tsx";

export default define.page(function Home(ctx) {
  return (
    <div class="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <Head>
        <title>🦕 Dinosaur Explorer</title>
        <meta name="description" content="Explore the fascinating world of dinosaurs with real-time cluster monitoring" />
        <style>{`
          .fade-in { animation: fadeIn 0.8s ease-out; }
          .slide-up { animation: slideUp 0.6s ease-out; }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .nav-tab.active {
            background: #3b82f6;
            color: white;
          }
          
          .tab-content {
            display: none;
          }
          
          .tab-content.active {
            display: block;
          }
        `}</style>
      </Head>
      
      <div class="container mx-auto px-4 py-8">
        {/* Header */}
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-8 mb-8 text-center fade-in">
          <h1 class="text-4xl font-bold mb-4">🦕 Dinosaur Explorer</h1>
          <p class="text-blue-100 text-lg">
            Explore the fascinating world of dinosaurs with real-time cluster monitoring
          </p>
        </div>

        {/* Navigation Tabs */}
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 slide-up">
          <div class="flex border-b">
            <button 
              id="dinosaurs-tab"
              class="nav-tab flex-1 py-4 px-6 text-center font-semibold transition-colors hover:bg-gray-50 active border-b-2 border-blue-500"
              onclick="showTab('dinosaurs')"
            >
              🦕 Dinosaurs
            </button>
            <button 
              id="cluster-tab"
              class="nav-tab flex-1 py-4 px-6 text-center font-semibold transition-colors hover:bg-gray-50"
              onclick="showTab('cluster')"
            >
              📊 Cluster Status
            </button>
          </div>

          {/* Dinosaurs Tab Content */}
          <div id="dinosaurs-content" class="tab-content active p-8">
            <DinosaurBrowser />
          </div>

          {/* Cluster Status Tab Content */}
          <div id="cluster-content" class="tab-content p-8">
            <ClusterStatus />
          </div>
        </div>
      </div>

      {/* JavaScript for tab switching */}
      <script dangerouslySetInnerHTML={{
        __html: `
          function showTab(tabName) {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.nav-tab').forEach(tab => {
              tab.classList.remove('active', 'border-b-2', 'border-blue-500');
              tab.classList.add('hover:bg-gray-50');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
              content.classList.remove('active');
            });
            
            // Add active class to selected tab and content
            const selectedTab = document.getElementById(tabName + '-tab');
            const selectedContent = document.getElementById(tabName + '-content');
            
            if (selectedTab && selectedContent) {
              selectedTab.classList.add('active', 'border-b-2', 'border-blue-500');
              selectedTab.classList.remove('hover:bg-gray-50');
              selectedContent.classList.add('active');
            }
          }
        `
      }} />
    </div>
  );
});
