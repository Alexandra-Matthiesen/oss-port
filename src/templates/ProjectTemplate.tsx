import { Helmet } from "react-helmet";
import React, { FunctionComponent } from "react";
import { graphql, Link } from "gatsby";
import { MDXProvider } from "@mdx-js/react";
import Overview from "../components/markdown/Overview";
import Contributing from "../components/markdown/Contributing";
import { MDXRenderer } from "gatsby-plugin-mdx";
import { ProjectContextProvider } from "../components/ProjectContext";
import mdxElements from "../components/markdown/mdxElements";
import RepoStats from "../components/RepoStats";
import RepoLinks from "../components/RepoLinks";
import ProjectTabs from "../components/ProjectTabs";
import LearnSection from "../components/markdown/LearnSection";
import Tag from "../components/Tag";
import { ProjectFrontmatter } from "../types";
import RootLayout from "../components/RootLayout";

// Make some React components available globally in MDX files
const mdxComponents = {
  ...mdxElements,
  // Make some custom React components available as shortcodes
  Overview,
  Contributing,
} as const;

type ProjectTemplateProps = {
  data: {
    projectData: {
      frontmatter: ProjectFrontmatter;
      body: string;
      parent: {
        organization: string;
      };
    };
  };
  pageContext: any;
};

const ProjectTemplate: FunctionComponent<ProjectTemplateProps> = ({
  data: { projectData },
  pageContext,
}) => {
  const { githubData, featuredMapMetadata } = pageContext;

  // Dynamically populate the tabs based on the existing sections
  const hasOverviewTab = projectData.body.includes("mdx(Overview,");
  const hasContributingTab = projectData.body.includes("mdx(Contributing,");
  const hasLearnTab = projectData.frontmatter.learnLinks?.length > 0;

  return (
    <RootLayout>
      <div className="max-w-4xl mx-auto py-12 px-2">
        <Helmet title={`OSS Port | ${projectData.frontmatter.name}`} />
        <Link to="/">Home</Link>
        <div className="md:flex mb-4 justify-between">
          <h1 className="mb-2 md:mb-0 text-black-500 font-bold text-4xl mr-4">
            {projectData.frontmatter.name}
          </h1>
          <div className="space-x-2 flex-grow pt-2">
            {projectData.frontmatter.tags.map((tag) => (
              <Tag key={tag} tag={tag} />
            ))}
          </div>
        </div>
        <div className="md:flex mb-6">
          <RepoLinks frontmatter={projectData.frontmatter} />
          <RepoStats className="bg-white p-4 flex-shrink" stats={githubData} />
        </div>
        <ProjectTabs
          hasContributingTab={hasContributingTab}
          hasOverviewTab={hasOverviewTab}
          hasLearnTab={hasLearnTab}
        />
        <ProjectContextProvider
          value={{
            frontmatter: projectData.frontmatter,
            githubData,
            featuredMapMetadata,
            organization: projectData.parent.organization,
          }}
        >
          <MDXProvider components={mdxComponents}>
            <MDXRenderer>{projectData.body}</MDXRenderer>
          </MDXProvider>
          <LearnSection />
        </ProjectContextProvider>
      </div>
    </RootLayout>
  );
};

export const pageQuery = graphql`
  query ProjectByPath($slug: String!) {
    projectData: mdx(slug: { eq: $slug }) {
      body
      frontmatter {
        name
        description
        repoUrl
        websiteUrl
        twitterUrl
        currentlySeeking
        featuredMap {
          url
          description
        }
        learnLinks {
          title
          url
        }
        tags
        contributionOverview {
          mainLocation
          idealEffort
          isMentorshipAvailable
          automatedDevEnvironment
          extras
        }
      }
      parent {
        ... on File {
          organization: relativeDirectory
        }
      }
    }
  }
`;

export default ProjectTemplate;
