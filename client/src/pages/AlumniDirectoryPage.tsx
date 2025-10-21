import RecommendedAlumniCarousel from "../components/organisms/RecommendedAlumniCarousel";

const AlumniDirectoryPage = () => {
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Alumni Network</h2>
        <p className="text-sm text-muted">Connect with experienced alumni from your college</p>
      </header>
      <RecommendedAlumniCarousel />
    </section>
  );
};

export default AlumniDirectoryPage;
